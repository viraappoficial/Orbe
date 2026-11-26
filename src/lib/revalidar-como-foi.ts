import { revalidatePath } from "next/cache";

// Atualiza na hora a home e as páginas "Como foi" depois de mexer nas mídias.
export const atualizarComoFoi = () => {
  revalidatePath("/");
  revalidatePath("/como-foi");
  revalidatePath("/como-foi/[slug]", "page");
};
