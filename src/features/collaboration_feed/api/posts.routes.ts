import { authAll } from '../../../middlewares/AuthMiddleware';
import { commentPostController, createPostController, deleteCommentController, deletePostController, editPostController, getAllPostController, getCommentsController, getLikeCountController, likePostController, unlikePostController, updateCommentController } from '../api/postController'
import { Router } from "express";

const router = Router();
router.post('/createPost',authAll,createPostController);
router.get('/',authAll,getAllPostController);
router.delete('/:postId/delete',authAll,deletePostController);
router.put('/:postId/edit',authAll,editPostController);
router.post('/:postId/like',authAll,likePostController);
router.delete('/:postId/like',authAll,unlikePostController);
router.get('/:postId/like',authAll,getLikeCountController);
router.post("/:postId/comment", authAll, commentPostController);
router.get("/:postId/comments", getCommentsController);
router.put("/:postId/comments/:commentId", authAll, updateCommentController);
router.delete("/:postId/comments/:commentId", authAll, deleteCommentController);



export default router;