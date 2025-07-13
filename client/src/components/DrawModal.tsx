import ConfirmationModal from './ConfirmationModal'

const DrawModal = ({drawModal,drawAccept,drawReject}:{drawModal:boolean,drawAccept:()=>void,drawReject:()=>void}) => {
    return (
        <div>{drawModal && (
            <ConfirmationModal
                text="Opponent Offered Draw"
                buttons={[
                    {
                        text: "Accept",
                        func: drawAccept,
                    },
                    {
                        text: "Reject",
                        func: drawReject,
                    },
                ]}
            />
        )}</div>
    )
}

export default DrawModal