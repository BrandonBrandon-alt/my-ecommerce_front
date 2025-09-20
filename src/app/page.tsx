
import { Button } from "@/components/animate-ui/components/buttons/button";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";

export default function Home() {
  return <div className="flex flex-col items-center justify-center h-screen">Home
    <div className="flex gap-4">
      <Button>Hola mundo</Button>
      <ThemeTogglerButton />
    </div>
  </div>;
}
