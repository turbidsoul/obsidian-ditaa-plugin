import { MarkdownPostProcessorContext, Plugin } from "obsidian";
import { exec } from "child_process";
// Remember to rename these classes and interfaces!

export default class SvgbobBlocksPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			"svgbob",
			async (src, el, ctx) => {
				await this.svgbobProcessor(src, el, ctx);
			}
		);
		this.registerMarkdownCodeBlockProcessor("csv", async (src, el, ctx) => {
			await this.csvProcessor(src, el, ctx);
		});
	}

	onunload() {}

	async svgbobProcessor(
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

	async csvProcessor(
		src: string,
		el: HTMLElement,
		ctx?: MarkdownPostProcessorContext
	) {
		let rows = src.split("\n").filter((row) => row.length > 0);
		let head = true;
		try {
			const matches = /^%\s(.*)\s%$/[Symbol.match](rows[0].trim());
			if (matches) {
				rows.splice(0, 1);
				const cfg = JSON.parse(matches[1]);
				head = cfg.head ?? true;
			}
		} catch (e) {
			el.createDiv("错误");
			return;
		}
		const table = el.createEl("table");
		if (head) {
			const thead = table.createEl("thead");
			const heads = rows.splice(0, 1)[0].split(",");
			for (let i in heads) {
				thead.createEl("th", { text: heads[i] });
			}
		}
		const body = table.createEl("tbody");
		for (let i = 0; i < rows.length; i++) {
			const cols = rows[i].split(",");

			const row = body.createEl("tr");

			for (let j = 0; j < cols.length; j++) {
				row.createEl("td", { text: cols[j] });
			}
		}
	}
}
