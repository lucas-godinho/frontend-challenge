import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "Design System/Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Raro", variant: "default" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "destructive"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Selo semântico adaptado do padrão shadcn/ui. Use default para raridade e destaque, secondary para informação neutra, outline para metadados e destructive para estados críticos. O texto precisa comunicar o estado sem depender apenas da cor.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Raridade: Story = {};
export const Secundario: Story = {
  args: { children: "Ethereum", variant: "secondary" },
};
export const Contorno: Story = {
  args: { children: "Edição limitada", variant: "outline" },
};
export const Indisponivel: Story = {
  args: { children: "Esgotado", variant: "destructive" },
};
