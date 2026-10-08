import { ImageResponse } from 'next/og'
import { getDish, getImageUrl } from '../../../lib/data'
import { absoluteUrl } from '../../../lib/site'

export const alt = 'Addis Eats dish'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage({ params }) {
  const { id } = await params
  const dish = getDish(id)
  const imageUrl = dish ? absoluteUrl(getImageUrl(dish.image)) : null

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', backgroundColor: '#20150f', color: 'white', fontFamily: 'Arial' }}>
      {imageUrl && <img src={imageUrl} alt="" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'absolute', inset: 0, padding: '56px', background: 'linear-gradient(0deg, rgba(0,0,0,.85), rgba(0,0,0,.05) 85%)' }}>
        <div style={{ display: 'flex', color: '#ff9b3d', fontSize: 24, fontWeight: 700, marginBottom: 14 }}>ADDIS EATS</div>
        <div style={{ display: 'flex', fontSize: 58, lineHeight: 1.1, fontWeight: 700 }}>{dish?.name ?? 'Discover Addis Eats'}</div>
        {dish && <div style={{ display: 'flex', fontSize: 30, marginTop: 16 }}>{dish.price.toLocaleString()} ETB · {dish.description}</div>}
      </div>
    </div>,
    size,
  )
}
