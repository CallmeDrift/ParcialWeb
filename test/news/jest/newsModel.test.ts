import fs from 'node:fs';
import NewsModel from '../../../src/news/model/NewsModel';
import News from '../../../src/news/types/News';

jest.mock('node:fs');

describe('NewsModel', () => {
  let model: NewsModel;
  const mockNews: News[] = [
    { id: 1, title: 'A', summary: 'resumen', content: 'contenido bla bla bla', image: 'img.png', date: '2020-01-01', comments: 'bueno' },
    { id: 2, title: 'B', summary: 'resumen ssj2', content: 'contenido 2 bla bla bla 2', image: 'img2.png', date: '2020-01-02', comments: 'malo' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    model = new NewsModel();
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockNews));
  });

  test('getAllNews debe retornar todas las noticias', () => {
    const result = model.getAllNews();
    expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('news.json'), 'utf-8');
    expect(result).toEqual(mockNews);
  });

  test('getNewsById debe retornar la noticia correcta', () => {
    const news = model.getNewsById(2);
    expect(news?.id).toBe(2);
  });

  test('getNewsById debe retornar undefined si no existe', () => {
    const news = model.getNewsById(999);
    expect(news).toBeUndefined();
  });

  test('searchNews debe filtrar por titulo', () => {
    const results = model.searchNews('a');
    expect(results.length).toBe(1);
    expect(results[0]).toBeDefined();
    expect(results[0]!.title).toBe('A');
  });

  test('saveNews debe agregar una nueva noticia y escribir el archivo', () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    const newData = { title: 'C', summary: 'ss', content: 'cc', image: 'ii', date: 'dd', comments: 'z' };
    model.saveNews(newData);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    const [, writtenData] = (fs.writeFileSync as jest.Mock).mock.calls[0];
    const parsed = JSON.parse(writtenData);
    expect(parsed.length).toBe(mockNews.length + 1);
    expect(parsed.at(-1).title).toBe('C');
  });

  test('saveNews debe asignar id=1 si el archivo está vacío (NewsModel)', () => {
    // Simula un archivo vacío
    (fs.readFileSync as jest.Mock).mockReturnValue('[]');
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

    model.saveNews({ title: 'C2', summary: 'ss', content: 'cc', image: 'ii', date: 'dd', comments: 'z' });

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    const written = JSON.parse((fs.writeFileSync as jest.Mock).mock.calls[0][1]);
    expect(written[0].id).toBe(1);
    expect(written[0].title).toBe('C2');
  });
});
