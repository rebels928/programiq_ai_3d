import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { projectId, modelUrl, source } = body

    if (!projectId || !modelUrl || source !== 'url') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(modelUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate file extension
    const urlLower = modelUrl.toLowerCase()
    if (!urlLower.includes('.gltf') && !urlLower.includes('.glb')) {
      return NextResponse.json(
        { error: 'URL must point to a .gltf or .glb file' },
        { status: 400 }
      )
    }

    // TODO: Save to Supabase database
    // This is a placeholder - you'll need to implement Supabase update
    /*
    Example Supabase implementation:

    import { createClient } from '@supabase/supabase-js'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const { error } = await supabase
      .from('projects')
      .update({
        model_source: 'url',
        model_url: modelUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) throw error
    */

    return NextResponse.json({
      success: true,
      message: 'Model URL saved successfully'
    })

  } catch (error) {
    console.error('Save URL error:', error)
    return NextResponse.json(
      { error: 'Failed to save URL' },
      { status: 500 }
    )
  }
}
