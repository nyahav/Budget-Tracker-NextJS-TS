import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";
import { ThemeProvider } from "next-themes";
import { ThemeSwitcherBtn } from "@/components/ThemeSwitcherBtn";

export const dynamic = 'force-dynamic'

export default async function IndexPage() {
    const spec = await getApiDocs();
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <section className="container">
                <div className="flex justify-end py-4">
                    <ThemeSwitcherBtn defaultTheme="light" />
                </div>
                <div className="mt-4">
                    <ReactSwagger spec={spec} />
                </div>
            </section>
        </ThemeProvider>
    );
}