import type { Plugin } from 'unified';
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to transform <rspress-map> tags to React components
 */
export const rehypeRspressMap: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'rspress-map') {
        // Transform to MDX JSX element
        const mdxNode: any = {
          type: 'mdxJsxFlowElement',
          name: 'RspressMap',
          attributes: [],
          children: node.children || []
        };
        
        // Convert HTML attributes to JSX attributes
        if (node.properties) {
          for (const [key, value] of Object.entries(node.properties)) {
            // Convert kebab-case to camelCase for React props
            // marker-text -> markerText
            const jsxKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            
            const attr: any = {
              type: 'mdxJsxAttribute',
              name: jsxKey
            };
            
            // Set value based on type
            // For MDX, string values should be wrapped in quotes
            if (typeof value === 'string') {
              attr.value = { type: 'mdxJsxAttributeValueExpression', value: JSON.stringify(value) };
            } else if (typeof value === 'boolean') {
              attr.value = { type: 'mdxJsxAttributeValueExpression', value: String(value) };
            } else {
              attr.value = { type: 'mdxJsxAttributeValueExpression', value: JSON.stringify(value) };
            }
            
            mdxNode.attributes.push(attr);
          }
        }
        
        // Replace the node
        Object.assign(node, mdxNode);
      }
    });
  };
};

export default rehypeRspressMap;
