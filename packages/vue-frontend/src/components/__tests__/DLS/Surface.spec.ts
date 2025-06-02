import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Surface from '../../DLS/Surface.vue';

describe('Surface', () => {
  it('renders', async () => {
    const wrapper = mount(Surface);
    await expect(wrapper.html()).toMatchFileSnapshot('./Surface.snap');
  })
});
