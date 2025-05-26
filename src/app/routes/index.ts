import express from 'express';
import { UserRouters } from '../modules/user/user.routes';
import { AuthRouters } from '../modules/auth/auth.routes';

import { categoryRoutes } from '../modules/focusArea/category.routes';
import { journalRoutes } from '../modules/journal/journal.routes';
import { QuoteRouter } from '../modules/quotes/quotes.routes';
import { bookRouter } from '../modules/books/book.routes';
import { notificationsRoute } from '../modules/Notification/Notification.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },

  {
    path: '/focuses',
    route: categoryRoutes,
  },
  {
    path:'/journals',
    route:journalRoutes
  },
  {
    path:'/quotes',
    route:QuoteRouter
  },
  {
    path:"/books",
    route:bookRouter
  },
  {
    path:"/notifications",
    route:notificationsRoute
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
