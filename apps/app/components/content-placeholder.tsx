import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ContentPlaceholderProps {
  placeholderImage: React.ComponentProps<typeof Image>["src"];
  title: string;
  description: string;
  buttonLabel: string;
  buttonOnPress?: () => void;
}

export function ContentPlaceholder({
  placeholderImage,
  title,
  description,
  buttonLabel,
  buttonOnPress,
}: ContentPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full p-16">
      <div className="relative w-64 h-64 mb-6">
        <Image
          src={placeholderImage}
          alt={title}
          fill
          className="object-contain"
          priority
        />
      </div>
      <h3 className="text-xl font-semibold mb-2 tracking-tight">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-sm text-balance">
        {description}
      </p>
      {buttonOnPress && (
        <Button onClick={buttonOnPress} size="lg">
          {buttonLabel}
        </Button>
      )}
      {!buttonOnPress && (
          <Button disabled size="lg">
            {buttonLabel}
          </Button>
      )}
    </div>
  );
}
