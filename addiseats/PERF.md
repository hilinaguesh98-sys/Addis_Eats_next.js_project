# Addis Eats Performance Notes

## Metrics and evidence

The initial values below were recorded in this file before this review. No Lighthouse report was saved in the repository to independently reproduce them. The production build now completes successfully, but no Lighthouse audit was run during this task, so no after improvement is claimed.

| Metric | Before (previously recorded) | Target | After this review |
| --- | ---: | ---: | --- |
| Lighthouse Performance | 0.73 (previously recorded; not independently verified) | 0.90 or better | Not measured: Lighthouse was not run for this task |
| LCP | 0.23 s (previously recorded; not independently verified) | Under 2.5 s | Not measured: Lighthouse was not run for this task |
| CLS | 0.000 | Under 0.1 | Not remeasured |
| INP | Not recorded | Under 200 ms | Not measured: Lighthouse was not run for this task |
| First Load JS, `/menu` | Not recorded | Under 120 kB | Not reported by this build output |
| Largest imported food image | 268,420 bytes (`app/assets/fries.jpg`) | Under 150 kB | 144,292 bytes (`app/assets/beyaynetu.webp`) |
| Shared Open Graph image | Not previously recorded | Under 150 kB | 130,412 bytes (`public/addiseats-food.jpg`) |

The imported food-asset sizes were measured before and after conversion. Five imported images that exceeded the threshold (`beef_burger.jpg`, `beyaynetu.jpg`, `doro_wat.jpg`, `fries.jpg`, and `shiro_wat.jpg`) were converted to WebP and their existing data imports now use the optimized assets. The largest of those changed from 268,420 bytes to 144,292 bytes, a 46.2% reduction; all currently imported food images are now below 150,000 bytes. The unused `hero.png` asset is not referenced by the app and is not included in this measure. CLS, route JavaScript size, and Lighthouse after values remain unverified rather than inferred.

## Existing optimization work

- Home hero uses `next/image`, intrinsic imported dimensions, `sizes="100vw"`, and high priority because it is the largest important above-the-fold image. Other food images use `next/image` with responsive sizing or intrinsic dimensions.
- Oversized imported food images are lossily compressed to WebP at the existing dimensions (fries is resized to 720 × 720 for its responsive card/detail use); imports preserve the same dish data and rendering components.
- Manrope is bundled with `next/font`; no external font link is used.
- No third-party runtime scripts were found, so no non-critical script needs lazy loading through `next/script`.
- The default Open Graph preview uses the existing 130,412-byte static image. Dish pages have data-specific generated previews.
- `.env.example` contains variable names/placeholders, and `.env*.local` is covered by `.gitignore`.

The previously recorded LCP improvement was attributed to converting the hero from a CSS background to a prioritized `next/image`. This review did not rerun Lighthouse, so it does not validate that prior comparison. `npm run build` completed successfully for this review.

## Reproduce measurements

From this application directory, build and serve the production app, then run Lighthouse:

```powershell
npm run build
npm start -- --port 3002
npm exec --yes --package=lighthouse -- lighthouse http://localhost:3002/ --chrome-path="C:\Program Files\Google\Chrome\Application\chrome.exe" "--chrome-flags=--headless --no-sandbox" --throttling-method=simulate --form-factor=mobile --output=json --quiet --no-enable-error-reporting
```

Run three production audits under the same settings and record the median and range. Then record `/menu` First Load JS from a successful production build and the actual largest image file size. Deployment Lighthouse, production URL/page-source checks, and remote sitemap/robots/OG verification remain outstanding until the app is deployed.
