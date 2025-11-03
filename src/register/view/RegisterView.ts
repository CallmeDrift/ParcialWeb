import { Response } from 'express'
export default class RegisterView  {
  renderAddForm(res: Response): void {
    res.render('addnews')
  }

  redirectToNews(res: Response): void {
    res.redirect('/news')
  }
}
