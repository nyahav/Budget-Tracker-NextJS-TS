import Link from "next/link";
import { Button } from "./ui/button";
import chatgptIcon from "@/public/chatgpticon.jpg";
import { cn } from "@/lib/utils";

export function ChatGPTButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "flex items-center gap-2 text-sm font-medium hover:text-primary"
      )}
      asChild 
    >
      <Link href="/chatgpt">
        <img
          src={chatgptIcon.src}
          alt="ChatGPT Icon"
          className="h-4 w-4"
        />
        Ask AI
      </Link>
    </Button>
  );
}