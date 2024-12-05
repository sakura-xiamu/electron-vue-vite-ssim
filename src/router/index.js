import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'SSIMDemoView',
            component: () => import('../views/SSIMDemoView.vue'),
        },
    ],
})

export default router
