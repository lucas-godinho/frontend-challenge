import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CatalogFilters } from "./CatalogFilters";
import { queryCatalog } from "@/mocks/catalog";
import type { CatalogQuery } from "@/types/marketplace";

function CatalogFiltersExample() {
  const [search, setSearch] = useState<CatalogQuery>({ category: "art" });
  return (
    <div className="max-w-[310px] bg-background p-6">
      <CatalogFilters
        category={search.category}
        search={search}
        facets={queryCatalog(search).facets}
        onUpdate={(next) => setSearch({ ...search, ...next })}
        onCategoryChange={(category) => setSearch({ ...search, category })}
      />
    </div>
  );
}

const meta = {
  title: "Home/Catálogo/Filtros",
  component: CatalogFiltersExample,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Painel de coleções, faixa de preço e redes, exibido ao lado dos resultados no layout desktop.",
      },
    },
  },
} satisfies Meta<typeof CatalogFiltersExample>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Desktop: Story = { name: "Filtros desktop" };
