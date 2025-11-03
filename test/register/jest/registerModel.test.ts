import fs from "node:fs";

import RegisterModel from "../../../src/register/model/RegisterModel";
import News from "../../../src/news/types/News";

jest.mock("node:fs");

describe("RegisterModel", () => {
  let model: RegisterModel;


  beforeEach(() => {
    jest.clearAllMocks();
    model = new RegisterModel();
  });

  test("saveNews debe agregar una nueva noticia correctamente", () => {
    const fakeData: News[] = [
      { id: 1, title: "a", summary: "s", content: "c", image: "i", date: "d", comments: "x" },
    ];

    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(fakeData));

    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    const newNews = {
      title: "Olibuendia",
      summary: "frase del año",
      content: "olibuendia",
      image: "img.png",
      date: "2025-01-01",
      comments: "el profe lenin dijo 'cancelen web'",
    };

    model.saveNews(newNews);

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

    const [filePath, writtenData] = (fs.writeFileSync as jest.Mock).mock.calls[0];
    expect(filePath.replace(/\\/g, "/")).toContain("database/news.json");

    const parsed = JSON.parse(writtenData);
    expect(parsed.length).toBe(2);
    expect(parsed[1]).toMatchObject({
      id: 2,
      title: "Olibuendia",
      summary: "frase del año",
    });
  });

  test("saveNews debe asignar id=1 si el archivo está vacío", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue("[]");
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    const newNews = {
      title: "prueba 1",
      summary: "megumin besto personaje",
      content: "Texto",
      image: "img.png",
      date: "2025-01-01",
      comments: "tengo sueño",
    };

    model.saveNews(newNews);

    const written = JSON.parse((fs.writeFileSync as jest.Mock).mock.calls[0][1]);
    expect(written[0].id).toBe(1);
  });
});
