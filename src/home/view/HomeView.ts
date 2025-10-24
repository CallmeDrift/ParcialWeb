import { Response } from 'express';
import News from '../../news/types/News';

export default class HomeView {
  public renderHome(res: Response, latestNews: News[]): void {
    res.render('home', { latestNews });
  }
}