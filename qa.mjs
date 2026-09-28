export default async function run(page, ui) {
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => (x.getAttribute('aria-label')||'').includes('to cart'));
    if (b) b.click();
  });
  await page.waitForTimeout(1500);
  const state = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"], .fixed.inset-0');
    return { modalVisible: !!modal, text: modal ? modal.textContent.slice(0,300) : document.body.innerText.slice(0,120) };
  });
  return state;
}
