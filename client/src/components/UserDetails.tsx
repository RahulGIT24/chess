type UserDetailsProps = { name: string }

const UserDetails = ({ name }: UserDetailsProps) => {
    return (

        <div className="flex flex-row items-center gap-x-5 w-full bg-zinc-700 text-white p-2">
            <img src="/user.png" alt="" className="w-10 h-10 bg-white rounded-full border border-white" />
            <p className="font-serif font-semibold text-xl">{name}</p>
        </div>

    )
}

export default UserDetails