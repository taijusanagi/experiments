// scripts/generate-ogp.ts
import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "fs/promises";
import React from "react";
import { getSortedNotesData } from "@/lib/notes";

const allNotes = getSortedNotesData();

async function generateOG(title: string) {
  const fontData = await readFile("./src/scripts/ogp/NotoSans-Regular.ttf");

  const svg = await satori(
    React.createElement(
      "div",
      {
        style: {
          fontSize: 48,
          background: "white",
          color: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Noto Sans",
        },
      },
      title
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });

  const png = resvg.render();
  return png.asPng();
}

async function main() {
  for (const { slug, title } of allNotes) {
    const buffer = await generateOG(title);
    const outPath = path.resolve(`./public/ogp/${slug}.png`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buffer);
    console.log(`✅ Generated ${outPath}`);
  }
}

main();
