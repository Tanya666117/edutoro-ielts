# Teacher avatar and navigation update

## Scope

- Rename the top navigation items from `老师` and `督学` to `一对一老师` and `多对一督学`.
- Map the four supplied portraits to Tony, Ciara, Esme, and Aliyaa by name.
- Replace each teacher card's large left-side poster image with a compact circular portrait.

## Layout

Keep the existing three-column teacher card structure and all current content. Use an approximately 112 px circular portrait in a 156 px-wide left column, centered horizontally and vertically. Apply `object-fit: cover`, a subtle neutral background, and a light ring so portraits with different source ratios remain visually consistent. On small screens, keep the portrait compact instead of stretching it across the card.

## Verification

Confirm all four names show the corresponding portraits, the navigation labels render on desktop and mobile, the page builds successfully, and the teacher page has no clipping or overlap at desktop and mobile widths.
