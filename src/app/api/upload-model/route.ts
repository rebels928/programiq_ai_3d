import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'Missing file or project ID' },
        { status: 400 }
      )
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.gltf') && !fileName.endsWith('.glb')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .gltf and .glb files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB' },
        { status: 400 }
      )
    }

    // TODO: Upload to Supabase Storage
    // This is a placeholder - you'll need to implement Supabase Storage upload
    // For now, return a mock URL
    const mockUrl = `/models/uploaded/${projectId}/${file.name}`

    /*
    Example Supabase Storage implementation:

    import { createClient } from '@supabase/supabase-js'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const fileBuffer = await file.arrayBuffer()
    const filePath = `${userId}/${projectId}/${file.name}`

    const { data, error } = await supabase.storage
      .from('models')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('models')
      .getPublicUrl(filePath)

    // Update project in database
    await supabase
      .from('projects')
      .update({
        model_source: 'upload',
        model_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', userId)
    */

    return NextResponse.json({
      success: true,
      url: mockUrl,
      message: 'Model uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
