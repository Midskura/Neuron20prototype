/**
 * SafeArea/Top - Transparent spacer for navbar offset
 * Height: 64px (matches Navbar/Sticky)
 * Purpose: Ensures content appears below the sticky navbar
 */
export function SafeAreaTop() {
  return <div className="h-16 w-full" aria-hidden="true" />;
}
