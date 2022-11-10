import { MarkdownPostProcessorContext, Plugin } from "obsidian";
import { exec } from "child_process";
// Remember to rename these classes and interfaces!

export default class SvgbobBlocksPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			"svgbob",
			async (src, el, ctx) => {
				await this.processor("svgbob", src, el, ctx);
			}
		);
		this.registerMarkdownCodeBlockProcessor("csv", async (src, el, ctx) => {
			const rows = src.split("\n").filter((row) => row.length > 0);

			const table = el.createEl("table");
			const body = table.createEl("tbody");

			for (let i = 0; i < rows.length; i++) {
				const cols = rows[i].split(",");

				const row = body.createEl("tr");

				for (let j = 0; j < cols.length; j++) {
					row.createEl("td", { text: cols[j] });
				}
			}
		});
	}

	onunload() {}

	async processor(
		type: string,
		src: string,
		el: HTMLElement,
		ctx?: MarkdownPostProcessorContext
	) {
		const div = el.createEl("div");
		exec(
			`svgbob -s "${src.split("\n").join("\\n")}"`,
			(error, stdout, stderr) => {
				if (stderr) {
					div.innerHTML = stderr;
				} else {
					div.innerHTML = stdout;
				}
			}
		);
	}
}
