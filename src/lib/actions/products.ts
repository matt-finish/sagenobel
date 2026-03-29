"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const productType = (formData.get("product_type") as string) || "custom";
  const priceRaw = formData.get("price") as string;
  const priceCents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;
  const affiliateUrl = formData.get("affiliate_url") as string;
  const images = formData.get("images") as string;
  const customFields = formData.get("custom_fields") as string;
  const tags = formData.get("tags") as string;
  const showDisclaimer = formData.get("show_disclaimer") === "true";
  const disclaimerText = formData.get("disclaimer") as string;
  const sectionIdsRaw = formData.get("section_ids") as string;
  const sectionIds: string[] = sectionIdsRaw ? JSON.parse(sectionIdsRaw) : [];
  const isActive = formData.get("is_active") === "true";

  const slug = slugify(name);

  const { data: product, error } = await supabase.from("products").insert({
    name,
    slug,
    description,
    product_type: productType,
    price_cents: productType === "custom" ? priceCents : null,
    affiliate_url: productType === "affiliate" ? affiliateUrl || null : null,
    images: images ? JSON.parse(images) : [],
    custom_fields: customFields ? JSON.parse(customFields) : [],
    tags: tags ? JSON.parse(tags) : [],
    show_disclaimer: showDisclaimer,
    disclaimer: showDisclaimer ? disclaimerText || null : null,
    is_active: isActive,
  }).select("id").single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A product with this name already exists." };
    }
    return { error: error.message };
  }

  // Insert section assignments
  if (sectionIds.length > 0 && product) {
    await supabase.from("product_section_items").insert(
      sectionIds.map((sectionId) => ({ product_id: product.id, section_id: sectionId }))
    );
  }

  revalidatePath("/products");
  revalidatePath("/");
  redirect("/dashboard/product-manager");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const productType = (formData.get("product_type") as string) || "custom";
  const priceRaw = formData.get("price") as string;
  const priceCents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;
  const affiliateUrl = formData.get("affiliate_url") as string;
  const images = formData.get("images") as string;
  const customFields = formData.get("custom_fields") as string;
  const tags = formData.get("tags") as string;
  const showDisclaimer = formData.get("show_disclaimer") === "true";
  const disclaimerText = formData.get("disclaimer") as string;
  const sectionIdsRaw = formData.get("section_ids") as string;
  const sectionIds: string[] = sectionIdsRaw ? JSON.parse(sectionIdsRaw) : [];
  const isActive = formData.get("is_active") === "true";

  const slug = slugify(name);

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      description,
      product_type: productType,
      price_cents: productType === "custom" ? priceCents : null,
      affiliate_url: productType === "affiliate" ? affiliateUrl || null : null,
      images: images ? JSON.parse(images) : [],
      custom_fields: customFields ? JSON.parse(customFields) : [],
      tags: tags ? JSON.parse(tags) : [],
      show_disclaimer: showDisclaimer,
      disclaimer: showDisclaimer ? disclaimerText || null : null,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Replace section assignments
  await supabase.from("product_section_items").delete().eq("product_id", id);
  if (sectionIds.length > 0) {
    await supabase.from("product_section_items").insert(
      sectionIds.map((sectionId) => ({ product_id: id, section_id: sectionId }))
    );
  }

  revalidatePath("/products");
  revalidatePath("/");
  redirect("/dashboard/product-manager");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/");
  redirect("/dashboard/product-manager");
}
