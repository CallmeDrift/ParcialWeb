import { Router, Request, Response } from "express";
import NewsModel from "../../news/model/NewsModel";
import HomeView from "../view/HomeView";


export default class HomeRouter {
  public readonly router: Router;
  private readonly model: NewsModel;
  private readonly view: HomeView;

  constructor(view: HomeView) {
    this.router = Router();
    this.model = new NewsModel();
    this.view = view;
    this.routes();
  }

  private readonly routes = (): void => {
    this.router.get("/", (_req: Request, res: Response) => {
      const allNews = this.model.getAllNews();
      const latestNews = allNews.slice(-3).reverse();
      this.view.renderHome(res, latestNews);
    });
  };
}
