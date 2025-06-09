import { authAll } from '../../../middlewares/AuthMiddleware';
import { createPostController, deletePostController, editPostController, getAllPostController, getLikeCountController, likePostController, unlikePostController } from '../api/postController'
import { Router } from "express";

const router = Router();
router.post('/createPost',authAll,createPostController);
router.get('/',authAll,getAllPostController);
router.delete('/:postId/delete',authAll,deletePostController);
router.put('/:postId/edit',authAll,editPostController);
router.post('/:postId/like',authAll,likePostController);
router.delete('/:postId/like',authAll,unlikePostController);
router.get('/:postId/like',authAll,getLikeCountController);


export default router;