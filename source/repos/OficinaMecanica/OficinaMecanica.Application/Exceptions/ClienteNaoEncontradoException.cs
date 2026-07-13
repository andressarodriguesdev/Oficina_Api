using System;

namespace OficinaMecanica.Application.Exceptions;

public class ClienteNaoEncontradoException : Exception
{
    public ClienteNaoEncontradoException(Guid id)
    : base($"Cliente com ID {id} não foi encontrado.")
    {

    }
}