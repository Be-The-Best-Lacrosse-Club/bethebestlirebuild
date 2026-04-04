import { Outlet } from "react-router-dom"

export function HubLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Outlet />
    </div>
  )
}
