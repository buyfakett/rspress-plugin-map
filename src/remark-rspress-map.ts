import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

/**
 * Remark plugin to transform <rspress-map> HTML tags to MDX JSX components
 * This runs before rehype, so we can transform HTML elements in markdown
 */
export const remarkRspressMap: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, ['html', 'mdxJsxFlowElement', 'mdxJsxTextElement'], (node: any, index: number | null, parent: any) => {
      // Handle HTML nodes
      if (node.type === 'html') {
        const htmlContent = node.value;

        // Debug: log all HTML nodes to see what we're processing
        if (htmlContent && htmlContent.includes('rspress-map')) {
          console.log('[remarkRspressMap] Found literal HTML rspress-map tag:', htmlContent);
        }

        // Match <rspress-map> tags - handle both self-closing and with closing tag
        // Pattern: <rspress-map ... /> or <rspress-map ...></rspress-map>
        const tagRegex = /<rspress-map\s+([^>]*?)(?:\s*\/>|>)/;
        const match = htmlContent.match(tagRegex);

        if (match) {
          console.log('[remarkRspressMap] Matched HTML tag, transforming...');
          const attrsString = match[1];
          const attrs: any[] = [];

          // Parse attributes: key="value" or key='value'
          const attrRegex = /(\w+(?:-\w+)*)\s*=\s*["']([^"']*)["']/g;
          let attrMatch;

          while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
            const key = attrMatch[1];
            const value = attrMatch[2];
            // Convert kebab-case to camelCase: marker-text -> markerText
            const jsxKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            attrs.push({ name: jsxKey, value });
          }

          // Create MDX JSX flow element
          const mdxNode: any = {
            type: 'mdxJsxFlowElement',
            name: 'RspressMap',
            attributes: attrs.map(attr => ({
              type: 'mdxJsxAttribute',
              name: attr.name,
              value: attr.value
            })),
            children: []
          };

          // Replace the HTML node with the MDX JSX node
          if (parent && typeof index === 'number') {
            parent.children[index] = mdxNode;
          }
        }
      }
      // Handle natively parsed MDX JSX elements
      else if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name === 'rspress-map') {
        console.log('[remarkRspressMap] Matched mdx tag, transforming name to RspressMap...');
        // Change the element name to match the exported React component
        node.name = 'RspressMap';

        // Convert existing attribute names from kebab-case to camelCase
        if (node.attributes && Array.isArray(node.attributes)) {
          node.attributes.forEach((attr: any) => {
            if (attr.type === 'mdxJsxAttribute' && typeof attr.name === 'string') {
              attr.name = attr.name.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
            }
          });
        }
      }
    });
  };
};

export default remarkRspressMap;
