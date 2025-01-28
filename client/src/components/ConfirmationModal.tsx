import Button from "./Button"

type ConfimationProps = {
    text: string,
    func: (args: boolean) => void
}

const ConfirmationModal = ({ text, func }: ConfimationProps) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white text-black bg-opacity-50 z-50">
            <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
                <h2 className="text-xl font-bold text-center mb-4">{text}</h2>
                <div className="flex justify-center items-center gap-x-6">
                    <Button onClick={() => { func(true) }} classname="w-48">Yes</Button>
                    <Button onClick={() => { func(false) }} classname="w-48">No</Button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal