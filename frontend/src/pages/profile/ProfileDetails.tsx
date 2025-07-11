export default function ProfileDetails({label= "", value="", capitalize=false}) {
  return (
    <p className="flex flex-col text-xs md:text-base gap-0.5  text-text-light">
    <span className="text-[10px] leading-[10px]  font-light ">{`${label}`}</span>
    <span className={`text-sm font-semibold text-[#096F30] ${capitalize?"capitalize":""}`}>{value}</span>
  </p>
  )
}
