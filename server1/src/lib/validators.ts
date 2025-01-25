import {z} from 'zod'

const moveSchema = z.object({
    from:z.string().length(2),
    to:z.string().length(2)
})

export const moveValidator = (move:Move):boolean=>
{
    const validation = moveSchema.safeParse(move);
    return validation.success
}