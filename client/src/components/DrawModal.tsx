import { type DrawModal } from '../lib/types'
import ConfirmationModal from './ConfirmationModal'

const DrawModal = ({drawModal,drawAccept,drawReject}:DrawModal) => {
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