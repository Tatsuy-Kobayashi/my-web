import { createHierarchyIndex } from './Hierarchy.mjs';

// maxDepth counts edges from this list's root: 0 = empty, 1 = immediate children.
// Each branch owns its open state; the same node may occur under several parents.
export function renderHierarchyList(container, nodes, rootId, maxDepth, renderNode, onChange = () => {}) {
    if (!container) return;
    if (!Number.isSafeInteger(maxDepth) || maxDepth < 0) throw new Error('maxDepth must be a non-negative integer');
    const index = createHierarchyIndex(nodes);
    const doc = container.ownerDocument;
    container.replaceChildren();
    if (!index.byId.has(rootId) || maxDepth === 0) return;
    const addChildren = (parentId, trail, depth) => {
        const list = doc.createElement('ul');
        list.className = 'ul_pulldownList';
        for (const entry of index.getChildren(parentId)) {
            if (trail.includes(entry.to)) continue;
            const childTrail = [...trail, entry.to];
            const li = doc.createElement('li');
            li.className = 'li_pulldownList';
            li.dataset.nodeId = String(entry.to);
            li.dataset.occurrence = `${container.id}:${childTrail.join('/')}`;
            li.dataset.relationType = entry.type;
            const hasChildren = depth < maxDepth && index.getChildren(entry.to).some(next => !childTrail.includes(next.to));
            if (hasChildren) {
                const details = doc.createElement('details');
                details.className = 'details_pulldownList';
                const summary = doc.createElement('summary');
                summary.className = 'summary_pulldownList';
                summary.innerHTML = renderNode(entry.node);
                details.append(summary);
                let populated = false;
                details.addEventListener('toggle', () => {
                    if (details.open && !populated) {
                        details.append(addChildren(entry.to, childTrail, depth + 1));
                        populated = true;
                    }
                    onChange();
                });
                li.append(details);
            } else {
                li.innerHTML = renderNode(entry.node);
            }
            list.append(li);
        }
        return list;
    };
    container.append(addChildren(rootId, [rootId], 1));
    onChange();
}
