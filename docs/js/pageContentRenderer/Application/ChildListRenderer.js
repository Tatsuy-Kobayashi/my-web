import { PREVLINK_BuildPreviewCardHtml } from '../Middleware/PreviewLinkBuilder.js';
import { DOMWRITER_GetContainer } from '../Middleware/DomWriter.js';
import { renderHierarchyList } from '../../common/siteHierarchy/HierarchyList.mjs';

export function CHLISTRENDR_RenderChildList(allData, current, maxDepth) {
    renderHierarchyList(DOMWRITER_GetContainer('child-pages-list'), allData, current?.id, maxDepth, PREVLINK_BuildPreviewCardHtml);
}
