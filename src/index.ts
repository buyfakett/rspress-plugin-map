import type { RspressPlugin } from '@rspress/core';
import path from 'path';
import { remarkRspressMap } from './remark-rspress-map';
import { rehypeRspressMap } from './rehype-rspress-map';

/**
 * Rspress map plugin options
 */
export interface MapPluginOptions {
  // Option fields can be preserved for backward compatibility
  // even if no longer directly used in the embedded iframe
}

/**
 * Rspress plugin for embedding interactive maps
 */
export function pluginMap(options: MapPluginOptions = {}): RspressPlugin {
  return {
    name: 'rspress-plugin-map',

    // Register the RspressMap component as a global component available in MDX
    markdown: {
      globalComponents: [
        path.join(__dirname, 'components', 'RspressMap.js')
      ],
      // Use remark plugin to transform <rspress-map> HTML tags to MDX JSX components
      remarkPlugins: [remarkRspressMap as any],
      // Also use rehype plugin as fallback for any remaining HTML elements
      rehypePlugins: [rehypeRspressMap as any]
    },

    // Add runtime module to handle component mapping
    addRuntimeModules() {
      return {
        'virtual:rspress-map-runtime': `
          // Runtime module for rspress-map component
          // This ensures the component is available globally
          export { default as RspressMap } from '${path.join(__dirname, 'components', 'RspressMap.js')}';
        `
      };
    }
  };
}

export default pluginMap;