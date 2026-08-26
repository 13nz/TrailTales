import { supabase } from './supabase'

// gets all favorites belonging to the currently signed-in user
export async function getFavorites() {
    const {
        data: {
            user,
        },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        throw userError
    }

    if (!user) {
        return []
    }

    const {
        data,
        error,
    } = await supabase
        .from('favorites')
        .select('*')
        .eq(
            'user_id',
            user.id
        )
        .order(
            'created_at',
            {
                ascending: false,
            }
        )

    if (error) {
        throw error
    }

    return data || []
}

// checks whether one specific item is currently a favorite
export async function isFavorite(
    itemType,
    itemId
) {
    const {
        data: {
            user,
        },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        throw userError
    }

    if (!user) {
        return false
    }

    const {
        data,
        error,
    } = await supabase
        .from('favorites')
        .select('id')
        .eq(
            'user_id',
            user.id
        )
        .eq(
            'item_type',
            itemType
        )
        .eq(
            'item_id',
            String(itemId)
        )
        .maybeSingle()

    if (error) {
        throw error
    }

    return !!data
}

// adds one item to the current user's favorites
export async function addFavorite(
    itemType,
    itemId
) {
    const {
        data: {
            user,
        },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        throw userError
    }

    if (!user) {
        throw new Error(
            'You must be signed in to add favorites.'
        )
    }

    const {
        data,
        error,
    } = await supabase
        .from('favorites')
        .insert({
            user_id: user.id,
            item_type:
                itemType,
            item_id:
                String(itemId),
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}

// removes one item from the current user's favorites
export async function removeFavorite(
    itemType,
    itemId
) {
    const {
        data: {
            user,
        },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        throw userError
    }

    if (!user) {
        throw new Error(
            'You must be signed in to remove favorites.'
        )
    }

    const {
        error,
    } = await supabase
        .from('favorites')
        .delete()
        .eq(
            'user_id',
            user.id
        )
        .eq(
            'item_type',
            itemType
        )
        .eq(
            'item_id',
            String(itemId)
        )

    if (error) {
        throw error
    }
}

// adds or removes a favorite and returns the new state
export async function toggleFavorite(
    itemType,
    itemId
) {
    const currentlyFavorite =
        await isFavorite(
            itemType,
            itemId
        )

    if (currentlyFavorite) {
        await removeFavorite(
            itemType,
            itemId
        )

        return false
    }

    await addFavorite(
        itemType,
        itemId
    )

    return true
}