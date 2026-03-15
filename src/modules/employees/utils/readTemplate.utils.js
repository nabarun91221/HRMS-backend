import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

const readTemplate = async (templateNameWithExtension, payload) =>
{
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const templatePath = path.join(
        __dirname,
        "../../../shared/template",
        templateNameWithExtension
    );

    try {
        let mailTemplate = await fs.readFile(templatePath, "utf-8");

        // Replace ALL {{ key }} patterns safely
        mailTemplate = mailTemplate.replace(
            /{{\s*(\w+)\s*}}/g,
            (_, key) => payload[key] ?? ""
        );

        return mailTemplate;
    } catch (error) {
        console.error("Template read error:", error);
        return null;
    }
};

export default readTemplate;