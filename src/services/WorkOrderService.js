import { supabase } from './supabase';

const WorkOrderService = {
  /**
   * Crear una nueva orden de trabajo
   * @param {Object} orderData - Datos de la orden de trabajo
   * @param {string} userId - ID del usuario autenticado
   * @returns {Object} - Orden de trabajo creada o error
   */
  async createWorkOrder(orderData, userId) {
    try {
      const {
        titulo,
        descripcion_corta,
        descripcion_larga,
        estado_id,
        prioridad_id,
        equipo_id,
        tipo_mantenimiento_id,
        fecha_inicio,
        fecha_estimada_fin
      } = orderData;

      // Preparar datos para inserción
      const workOrderData = {
        titulo: titulo.trim(),
        descripcion_corta: descripcion_corta.trim(),
        descripcion_larga: descripcion_larga?.trim() || null,
        estado_id,
        prioridad_id,
        equipo_id,
        tipo_mantenimiento_id,
        usuario_id: userId,
        fecha_inicio: fecha_inicio || new Date().toISOString(),
        fecha_estimada_fin,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orden_trabajo')
        .insert(workOrderData)
        .select()
        .single();

      if (error) {
        console.error('Error al crear orden de trabajo:', error);
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado al crear orden:', error);
      return { data: null, error: { message: 'Error inesperado al crear la orden de trabajo' } };
    }
  },

  /**
   * Obtener órdenes de trabajo por cliente
   * @param {string} userId - ID del usuario
   * @param {Object} filters - Filtros opcionales
   * @returns {Array} - Lista de órdenes de trabajo o error
   */
  async getWorkOrdersByClient(userId, filters = {}) {
    try {
      let query = supabase
        .from('orden_trabajo')
        .select(`
          *,
          estados_orden_trabajo!inner(nombre),
          prioridades!inner(nombre),
          tiposmantenimiento!inner(nombre_tipo),
          equipo!inner(nombre_equipo, codigo_equipo)
        `)
        .eq('usuario_id', userId);

      // Aplicar filtros si existen
      if (filters.status && filters.status !== 'Todas') {
        query = query.eq('estados_orden_trabajo.nombre', filters.status);
      }

      if (filters.priority) {
        query = query.eq('prioridades.nombre', filters.priority);
      }

      // Ordenar por fecha de creación (más recientes primero)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener órdenes de trabajo:', error);
        return { data: [], error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error inesperado al obtener órdenes:', error);
      return { data: [], error: { message: 'Error inesperado al cargar las órdenes de trabajo' } };
    }
  },

  /**
   * Obtener una orden de trabajo por ID
   * @param {string} orderId - ID de la orden de trabajo
   * @returns {Object} - Orden de trabajo o error
   */
  async getWorkOrderById(orderId) {
    try {
      const { data, error } = await supabase
        .from('orden_trabajo')
        .select(`
          *,
          estados_orden_trabajo!inner(nombre),
          prioridades!inner(nombre),
          tiposmantenimiento!inner(nombre_tipo),
          equipo!inner(nombre_equipo, codigo_equipo),
          orden_trabajo_fotos(
            url_foto,
            nombre_archivo,
            created_at
          )
        `)
        .eq('orden_trabajo_id', orderId)
        .single();

      if (error) {
        console.error('Error al obtener orden de trabajo por ID:', error);
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado al obtener orden por ID:', error);
      return { data: null, error: { message: 'Error inesperado al cargar los detalles de la orden' } };
    }
  },

  /**
   * Agregar comentario a una orden de trabajo
   * @param {string} orderId - ID de la orden de trabajo
   * @param {string} userId - ID del usuario
   * @param {string} commentText - Texto del comentario
   * @returns {Object} - Comentario creado o error
   */
  async addWorkOrderComment(orderId, userId, commentText) {
    try {
      // Primero verificar si existe tabla de comentarios, si no usar estructura simple
      const commentData = {
        orden_id: orderId,
        usuario_id: userId,
        texto_comentario: commentText.trim(),
        created_at: new Date().toISOString()
      };

      // Intentar insertar en tabla de comentarios (asumiendo que existe)
      const { data, error } = await supabase
        .from('orden_trabajo_comentarios')
        .insert(commentData)
        .select(`
          *,
          usuario:usuario_id(nombre_usuario, email)
        `)
        .single();

      if (error) {
        console.error('Error al agregar comentario:', error);
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error inesperado al agregar comentario:', error);
      return { data: null, error: { message: 'Error inesperado al agregar el comentario' } };
    }
  },

  /**
   * Obtener comentarios de una orden de trabajo
   * @param {string} orderId - ID de la orden de trabajo
   * @returns {Array} - Lista de comentarios o error
   */
  async getWorkOrderComments(orderId) {
    try {
      const { data, error } = await supabase
        .from('orden_trabajo_comentarios')
        .select(`
          *,
          usuario:usuario_id(nombre_usuario, email)
        `)
        .eq('orden_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error al obtener comentarios:', error);
        return { data: [], error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error inesperado al obtener comentarios:', error);
      return { data: [], error: { message: 'Error inesperado al cargar los comentarios' } };
    }
  },

  /**
   * Subir adjunto a una orden de trabajo
   * @param {string} orderId - ID de la orden de trabajo
   * @param {string} fileUri - URI local del archivo
   * @param {string} fileName - Nombre del archivo
   * @param {string} mimeType - Tipo MIME del archivo
   * @returns {Object} - URL pública del archivo o error
   */
  async uploadAttachment(orderId, fileUri, fileName, mimeType) {
    try {
      // Crear nombre único para el archivo
      const timestamp = new Date().getTime();
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${orderId}_${timestamp}.${fileExtension}`;
      const filePath = `work-order-attachments/${uniqueFileName}`;

      // Convertir URI a blob para Supabase Storage
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('work-order-attachments')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: false
        });

      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);
        return { data: null, error: { message: uploadError.message } };
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from('work-order-attachments')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Guardar referencia en la base de datos
      const { data: dbData, error: dbError } = await supabase
        .from('orden_trabajo_fotos')
        .insert({
          orden_id: orderId,
          url_foto: publicUrl,
          nombre_archivo: fileName,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error al guardar referencia del archivo:', dbError);
        // Intentar eliminar el archivo subido si no se pudo guardar la referencia
        await supabase.storage
          .from('work-order-attachments')
          .remove([filePath]);
        
        return { data: null, error: { message: dbError.message } };
      }

      return { data: { url: publicUrl, ...dbData }, error: null };
    } catch (error) {
      console.error('Error inesperado al subir adjunto:', error);
      return { data: null, error: { message: 'Error inesperado al subir el archivo' } };
    }
  },

  /**
   * Obtener listas para selectores dinámicos
   * @param {string} userId - ID del usuario para filtrar equipos por local
   * @returns {Object} - Listas de estados, prioridades, tipos de mantenimiento y equipos
   */
  async getFormData(userId) {
    try {
      // Obtener local_id del usuario
      const { data: userLocal, error: userLocalError } = await supabase
        .from('usuario_local')
        .select('local_id')
        .eq('usuario_id', userId)
        .single();

      if (userLocalError) {
        console.error('Error al obtener local del usuario:', userLocalError);
        return { 
          data: null, 
          error: { message: 'Error al obtener información del usuario' } 
        };
      }

      const localId = userLocal.local_id;

      // Ejecutar todas las consultas en paralelo
      const [estadosResult, prioridadesResult, tiposResult, equiposResult] = await Promise.all([
        supabase
          .from('estados_orden_trabajo')
          .select('estado_id, nombre')
          .order('nombre'),
        
        supabase
          .from('prioridades')
          .select('prioridad_id, nombre')
          .order('nombre'),
        
        supabase
          .from('tiposmantenimiento')
          .select('tipo_mantenimiento_id, nombre_tipo')
          .order('nombre_tipo'),
        
        supabase
          .from('equipo')
          .select('equipo_id, nombre_equipo, codigo_equipo')
          .eq('local_id', localId)
          .order('nombre_equipo')
      ]);

      // Verificar errores en cada consulta
      if (estadosResult.error) {
        console.error('Error al obtener estados:', estadosResult.error);
        return { data: null, error: { message: 'Error al cargar estados' } };
      }

      if (prioridadesResult.error) {
        console.error('Error al obtener prioridades:', prioridadesResult.error);
        return { data: null, error: { message: 'Error al cargar prioridades' } };
      }

      if (tiposResult.error) {
        console.error('Error al obtener tipos de mantenimiento:', tiposResult.error);
        return { data: null, error: { message: 'Error al cargar tipos de mantenimiento' } };
      }

      if (equiposResult.error) {
        console.error('Error al obtener equipos:', equiposResult.error);
        return { data: null, error: { message: 'Error al cargar equipos' } };
      }

      return {
        data: {
          estados: estadosResult.data || [],
          prioridades: prioridadesResult.data || [],
          tiposMantenimiento: tiposResult.data || [],
          equipos: equiposResult.data || []
        },
        error: null
      };
    } catch (error) {
      console.error('Error inesperado al obtener datos del formulario:', error);
      return { 
        data: null, 
        error: { message: 'Error inesperado al cargar los datos del formulario' } 
      };
    }
  }
};

export default WorkOrderService;
