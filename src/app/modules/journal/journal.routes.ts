import { Router } from "express";
import auth from "../../middlewares/auth";
import { journalController } from "./journal.controllers";
import validateRequest from "../../middlewares/validateRequest";
import { journalValidation } from "./journal.validations";


const router = Router()


router.route("/").post ( validateRequest(journalValidation.createJournalSchema), auth(), journalController.createJournal).get(auth(), journalController.getAllJournals)
router.get("/search", auth(), journalController.searchJournal)
router.route("/:journalId").get(auth(), journalController.getSingleJournal).put(validateRequest(journalValidation.updateJournalSchema),auth(), journalController.updateJournal).delete(auth(), journalController.deleteJournal)


export const journalRoutes = router

