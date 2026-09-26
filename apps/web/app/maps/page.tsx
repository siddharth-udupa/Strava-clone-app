import MapView from '@/components/map/Map'


export default function Maps() {
  return (
    <main className='h-[calc(100vh-4rem)] w-full relative'>
      <MapView isChangeable={true} />
    </main>
  )
}