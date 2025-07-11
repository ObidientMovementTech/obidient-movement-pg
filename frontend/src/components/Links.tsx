import { UserIcon, PencilSquareIcon

} from '@heroicons/react/24/solid'
import { Link } from 'react-router'

export function ProfileLink() {
  return (
    <Link to={"/profile"} className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3  hover:bg-black/10 duration-300 delay-100 dark:text-text-dark dark:hover:bg-white/10 text-text-light">
    <UserIcon className="size-4 fill-accent-green " />
      Profile
  </Link>
  )
}
export function OnboardingLink() {
  return (
    <Link to={"/onboarding"} className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3  hover:bg-black/10 duration-300 delay-100 dark:text-text-dark dark:hover:bg-white/10 text-text-light">
    <PencilSquareIcon className="size-4 fill-accent-green " />
      Onboarding
  </Link>
  )
}
