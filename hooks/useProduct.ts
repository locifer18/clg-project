import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug } from "@/features/product/product.api";

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
};