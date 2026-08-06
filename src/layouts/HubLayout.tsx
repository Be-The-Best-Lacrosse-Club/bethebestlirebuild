import { Outlet } from "react-router"

export function HubLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Outlet />
    </div>
  )
}
