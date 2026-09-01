import { createPinia } from 'pinia';

export default ({ app }: { app: Record<string, unknown> }) => {
  const pinia = createPinia();
  (app as { use: (plugin: unknown) => void }).use(pinia);
};
