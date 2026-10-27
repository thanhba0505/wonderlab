import { TranslationDictionary } from '../../types';
import { navVi, headerVi, footerVi, adminNavVi } from './nav';
import { authVi } from './auth';
import { accountVi, profileVi } from './account';
import { homeVi, exploreVi } from './home';
import { requestsVi } from './requests';
import { essaysVi, commonVi } from './common';
import { simulationsVi } from './simulations';
import { birthdayVi } from './birthday';
import { montyHallVi } from './monty-hall';
import { doubleSlitVi } from './double-slit';
import { prisonersDilemmaVi } from './prisoners-dilemma';
import { zenoVi } from './zeno';
import { artGalleryVi } from './art-gallery';
import { prisonersHatsVi } from './prisoners-hats';
import { bodyguardVi } from './bodyguard';

export const vi: TranslationDictionary = {
  nav: navVi,
  header: headerVi,
  footer: footerVi,
  admin_nav: adminNavVi,
  auth: authVi,
  account: accountVi,
  profile: profileVi,
  home: homeVi,
  explore: exploreVi,
  requests: requestsVi,
  essays: essaysVi,
  common: commonVi,
  simulations: simulationsVi,
  sim_birthday: birthdayVi,
  sim_monty_hall: montyHallVi,
  sim_double_slit: doubleSlitVi,
  sim_prisoners_dilemma: prisonersDilemmaVi,
  sim_zeno: zenoVi,
  sim_art_gallery: artGalleryVi,
  sim_prisoners_hats: prisonersHatsVi,
  sim_bodyguard: bodyguardVi,
};
