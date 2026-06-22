import { arrayMove } from '@dnd-kit/sortable';

/**
 * Reorders items belonging to the current tab within the full list,
 * leaving items in other tabs untouched.
 */
export function applyTabReorder(allItems, tabItems, oldIndex, newIndex) {
  const reorderedTab = arrayMove(tabItems, oldIndex, newIndex);
  const tabIdSet = new Set(tabItems.map((i) => i.id));
  const slotIndices = allItems.reduce((acc, item, idx) => {
    if (tabIdSet.has(item.id)) acc.push(idx);
    return acc;
  }, []);
  const result = [...allItems];
  slotIndices.forEach((slotIdx, i) => {
    result[slotIdx] = reorderedTab[i];
  });
  return { newAllItems: result, reorderedIds: reorderedTab.map((i) => i.id) };
}
