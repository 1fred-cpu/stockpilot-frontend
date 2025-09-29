import { Loader2 } from "lucide-react";

export default function Spinner({ color }: { color?: string }) {
  return (
    <Loader2 className="w-5 h-5 animate-spin text-primary" color={color} />
  );
}
